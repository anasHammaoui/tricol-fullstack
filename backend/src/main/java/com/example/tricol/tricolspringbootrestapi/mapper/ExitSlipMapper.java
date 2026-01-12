package com.example.tricol.tricolspringbootrestapi.mapper;

import com.example.tricol.tricolspringbootrestapi.dto.response.ExitSlipResponse;
import com.example.tricol.tricolspringbootrestapi.model.ExitSlip;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring", uses = {ExitSlipItemMapper.class})
public interface ExitSlipMapper {
    
    @Mapping(source = "items", target = "items")
    ExitSlipResponse toResponse(ExitSlip exitSlip);
    
    List<ExitSlipResponse> toResponseList(List<ExitSlip> exitSlips);
}
