package com.tesistrack.service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tesistrack.config.ForbiddenException;
import com.tesistrack.dto.ContactoDto;
import com.tesistrack.dto.ConversacionDto;
import com.tesistrack.dto.HiloDto;
import com.tesistrack.dto.MensajeDto;
import com.tesistrack.dto.MensajeRequest;
import com.tesistrack.model.Mensaje;
import com.tesistrack.model.Proyecto;
import com.tesistrack.model.Role;
import com.tesistrack.model.User;
import com.tesistrack.repository.MensajeRepository;
import com.tesistrack.repository.ProyectoRepository;
import com.tesistrack.repository.UserRepository;

/**
 * Mensajes privados uno a uno (Decisión 28).
 *
 * <p>Quién le puede escribir a quién sale de la <b>tesis compartida</b>, la misma
 * relación que ya ordena los permisos del resto del sistema:
 * <ul>
 *   <li>el estudiante, a su profesor y a sus compañeros de grupo;</li>
 *   <li>el profesor, a los integrantes de las tesis a su cargo (de sus clases o
 *       asesorías privadas).</li>
 * </ul>
 * Nadie le escribe a un desconocido: un estudiante no puede escribirle a alguien de
 * otro grupo (Personas ni siquiera le muestra su correo, Decisión 22). El
 * coordinador no participa: su alcance es leer el avance de las tesis, no las
 * conversaciones de las personas (Decisión 8).
 *
 * <p>Si la relación se corta (el grupo sale de la clase, cambia el profesor), el
 * historial se conserva para los dos, pero ya no se puede escribir.
 */
@Service
@Transactional
public class MensajeService {

    /** Mensajes por minuto y por persona: de sobra para conversar, poco para llenar una bandeja. */
    static final int MAXIMO_POR_MINUTO = 20;

    private final MensajeRepository mensajeRepository;
    private final ProyectoRepository proyectoRepository;
    private final UserRepository userRepository;
    private final AccesoService acceso;
    private final LimitadorConsultas limitador;

    public MensajeService(
            MensajeRepository mensajeRepository,
            ProyectoRepository proyectoRepository,
            UserRepository userRepository,
            AccesoService acceso,
            LimitadorConsultas limitador) {
        this.mensajeRepository = mensajeRepository;
        this.proyectoRepository = proyectoRepository;
        this.userRepository = userRepository;
        this.acceso = acceso;
        this.limitador = limitador;
    }

    @Transactional(readOnly = true)
    public List<ContactoDto> contactos(Authentication authentication) {
        return new ArrayList<>(contactosDe(participante(authentication)).values());
    }

    /** La bandeja: una fila por persona con la que hay mensajes, la conversación más reciente primero. */
    @Transactional(readOnly = true)
    public List<ConversacionDto> conversaciones(Authentication authentication) {
        User yo = participante(authentication);
        Map<Long, ContactoDto> contactos = contactosDe(yo);

        Map<Long, List<Mensaje>> porPersona = new LinkedHashMap<>();
        for (Mensaje m : mensajeRepository.deUsuario(yo.getId())) {
            User otro = m.getRemitente().getId().equals(yo.getId()) ? m.getDestinatario() : m.getRemitente();
            porPersona.computeIfAbsent(otro.getId(), k -> new ArrayList<>()).add(m);
        }

        List<ConversacionDto> bandeja = new ArrayList<>();
        porPersona.forEach((otroId, mensajes) -> {
            Mensaje ultimo = mensajes.get(0);
            User otro = ultimo.getRemitente().getId().equals(yo.getId()) ? ultimo.getDestinatario() : ultimo.getRemitente();
            long noLeidos = mensajes.stream()
                .filter(m -> m.getDestinatario().getId().equals(yo.getId()) && m.getLeidoAt() == null)
                .count();
            ContactoDto contacto = contactos.getOrDefault(otroId, exContacto(otro));
            bandeja.add(new ConversacionDto(
                contacto,
                ultimo.getTexto(),
                ultimo.getCreatedAt(),
                ultimo.getRemitente().getId().equals(yo.getId()),
                noLeidos,
                contactos.containsKey(otroId)));
        });
        return bandeja;
    }

    /**
     * Una conversación. Se puede abrir si la otra persona es un contacto o si ya hubo
     * mensajes (historial de una relación que se cortó). Si no, 403 —también cuando
     * el id no existe: no se confirma quién está registrado.
     */
    @Transactional(readOnly = true)
    public HiloDto hilo(Long otroId, Authentication authentication) {
        User yo = participante(authentication);
        Map<Long, ContactoDto> contactos = contactosDe(yo);
        boolean esContacto = contactos.containsKey(otroId);
        if (!esContacto && !mensajeRepository.hayConversacion(yo.getId(), otroId)) {
            throw new ForbiddenException("No podés ver esa conversación");
        }
        ContactoDto contacto = esContacto
            ? contactos.get(otroId)
            : exContacto(userRepository.findById(otroId).orElseThrow(() -> new ForbiddenException("No podés ver esa conversación")));
        List<MensajeDto> mensajes = mensajeRepository.conversacion(yo.getId(), otroId).stream()
            .map(m -> MensajeDto.from(m, yo.getId()))
            .toList();
        return new HiloDto(contacto, esContacto, mensajes);
    }

    public MensajeDto enviar(Long otroId, MensajeRequest request, Authentication authentication) {
        User yo = participante(authentication);
        if (!contactosDe(yo).containsKey(otroId)) {
            throw new ForbiddenException(
                "Solo podés escribirle a tu profesor y a tus compañeros de grupo (o, si sos profesor, a tus alumnos)");
        }
        limitador.registrarUso("mensaje:" + yo.getId(), MAXIMO_POR_MINUTO,
            "Mandaste muchos mensajes seguidos. Esperá un minuto y seguí.");

        Mensaje mensaje = new Mensaje();
        mensaje.setRemitente(yo);
        mensaje.setDestinatario(userRepository.getReferenceById(otroId));
        mensaje.setTexto(request.texto());
        return MensajeDto.from(mensajeRepository.save(mensaje), yo.getId());
    }

    /** Marca como leído lo que la otra persona le mandó a quien pregunta. */
    public void marcarLeidos(Long otroId, Authentication authentication) {
        User yo = participante(authentication);
        mensajeRepository.marcarLeidos(otroId, yo.getId(), Instant.now());
    }

    /** Para el número del menú. El coordinador no tiene mensajes: siempre cero, sin error. */
    @Transactional(readOnly = true)
    public long noLeidos(Authentication authentication) {
        User yo = acceso.usuarioActual(authentication);
        return yo.getRole() == Role.COORDINADOR ? 0 : mensajeRepository.countByDestinatarioIdAndLeidoAtIsNull(yo.getId());
    }

    private User participante(Authentication authentication) {
        User yo = acceso.usuarioActual(authentication);
        if (yo.getRole() == Role.COORDINADOR) {
            throw new ForbiddenException("Los mensajes privados son entre profesores y estudiantes");
        }
        return yo;
    }

    /**
     * Las personas con las que {@code yo} comparte una tesis vigente, sin repetir. Si
     * alguien aparece por dos motivos, queda el primero.
     */
    private Map<Long, ContactoDto> contactosDe(User yo) {
        Map<Long, ContactoDto> contactos = new LinkedHashMap<>();
        if (yo.getRole() == Role.ASESOR) {
            for (Proyecto p : proyectoRepository.findByAsesorId(yo.getId())) {
                String relacion = p.getArea() != null ? "Alumno · " + p.getArea().getNombre() : "Asesoría privada";
                for (User e : p.getEstudiantesOrdenados()) {
                    contactos.putIfAbsent(e.getId(), new ContactoDto(e.getId(), e.getName(), e.getRole(), relacion));
                }
            }
            return contactos;
        }
        for (Proyecto p : proyectoRepository.findByEstudiantesId(yo.getId())) {
            User asesor = p.getAsesor();
            if (asesor != null) {
                contactos.putIfAbsent(asesor.getId(), new ContactoDto(asesor.getId(), asesor.getName(), asesor.getRole(), "Tu profesor"));
            }
            for (User e : p.getEstudiantesOrdenados()) {
                if (!e.getId().equals(yo.getId())) {
                    contactos.putIfAbsent(e.getId(), new ContactoDto(e.getId(), e.getName(), e.getRole(), "Compañero de grupo"));
                }
            }
        }
        return contactos;
    }

    private static ContactoDto exContacto(User otro) {
        return new ContactoDto(otro.getId(), otro.getName(), otro.getRole(), "Ya no comparten tesis ni clase");
    }
}
