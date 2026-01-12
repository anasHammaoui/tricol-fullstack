package com.example.tricol.tricolspringbootrestapi.mapper;

import com.example.tricol.tricolspringbootrestapi.dto.response.ExitSlipItemResponse;
import com.example.tricol.tricolspringbootrestapi.model.ExitSlipItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ExitSlipItemMapper {
    
    @Mapping(source = "product.id", target = "productId")
    @Mapping(source = "product.name", target = "productName")
    @Mapping(source = "product.reference", target = "productReference")
    ExitSlipItemResponse toResponse(ExitSlipItem item);
    
    List<ExitSlipItemResponse> toResponseList(List<ExitSlipItem> items);
}
