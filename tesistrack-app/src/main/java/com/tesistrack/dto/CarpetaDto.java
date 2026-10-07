package com.tesistrack.dto;

import java.util.List;

import com.tesistrack.model.CarpetaMaterial;

public record CarpetaDto(Long id, Long areaId, String nombre, Integer orden, List<MaterialDto> materiales) {

    public static CarpetaDto from(CarpetaMaterial carpeta, List<MaterialDto> materiales) {
        return new CarpetaDto(
            carpeta.getId(), carpeta.getArea().getId(), carpeta.getNombre(), carpeta.getOrden(), materiales);
    }
}
