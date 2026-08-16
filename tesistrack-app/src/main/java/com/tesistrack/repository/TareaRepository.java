package com.tesistrack.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tesistrack.model.Tarea;

public interface TareaRepository extends JpaRepository<Tarea, Long> {

    List<Tarea> findByProyectoId(Long proyectoId);

    List<Tarea> findByProyectoIdAndCompletada(Long proyectoId, boolean completada);

    List<Tarea> findByResponsableIdAndCompletada(Long responsableId, boolean completada);
}
