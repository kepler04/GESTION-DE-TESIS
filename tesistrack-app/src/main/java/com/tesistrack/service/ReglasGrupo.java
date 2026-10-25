package com.tesistrack.service;

import java.util.Optional;

import org.springframework.stereotype.Component;

import com.tesistrack.model.Area;
import com.tesistrack.model.Proyecto;
import com.tesistrack.model.User;
import com.tesistrack.repository.ProyectoRepository;

/**
 * Las dos reglas de los grupos de una clase (Decisión 30), en un solo lugar, para
 * que las apliquen igual todos los caminos por los que alguien entra a un grupo:
 * crear la tesis con el código, unirse a un grupo, aceptar una invitación, sumar por
 * correo o traer un grupo existente a la clase.
 *
 * <ul>
 *   <li><b>Un grupo por clase:</b> nadie está en dos grupos de la misma clase. Si no,
 *       el profesor vería a la misma persona dos veces y no sabría qué entrega mirar.</li>
 *   <li><b>Cupo:</b> un grupo no supera el tope de integrantes de su clase.</li>
 * </ul>
 */
@Component
public class ReglasGrupo {

    private final ProyectoRepository proyectoRepository;

    public ReglasGrupo(ProyectoRepository proyectoRepository) {
        this.proyectoRepository = proyectoRepository;
    }

    /** El grupo de {@code estudiante} en {@code area}, sin contar {@code excepto}. */
    public Optional<Proyecto> grupoEnClase(User estudiante, Area area, Long excepto) {
        return proyectoRepository.findByEstudiantesId(estudiante.getId()).stream()
            .filter(p -> p.getArea() != null && p.getArea().getId().equals(area.getId()))
            .filter(p -> excepto == null || !p.getId().equals(excepto))
            .findFirst();
    }

    public void verificarSinGrupoEnClase(User estudiante, Area area, Long excepto, boolean esUnoMismo) {
        if (grupoEnClase(estudiante, area, excepto).isPresent()) {
            throw new IllegalArgumentException(esUnoMismo
                ? "Ya estás en un grupo de esta clase. Para cambiarte, salí primero del que tenés."
                : estudiante.getName() + " ya está en otro grupo de esta clase");
        }
    }

    /** Lugares libres del grupo según el tope de su clase; sin clase, no hay tope. */
    public int cupoLibre(Proyecto proyecto) {
        if (proyecto.getArea() == null) {
            return Integer.MAX_VALUE;
        }
        return Math.max(0, proyecto.getArea().getTopeGrupo() - proyecto.getEstudiantes().size());
    }

    public void verificarCupo(Proyecto proyecto) {
        if (cupoLibre(proyecto) <= 0) {
            throw new IllegalArgumentException("El grupo está completo: la clase admite hasta "
                + proyecto.getArea().getTopeGrupo() + " integrantes");
        }
    }
}
