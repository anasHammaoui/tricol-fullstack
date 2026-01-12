package com.example.tricol.tricolspringbootrestapi.service;

import com.example.tricol.tricolspringbootrestapi.dto.request.SupplierDTO;
import com.example.tricol.tricolspringbootrestapi.model.Supplier;

import java.util.List;

public interface SupplierServiceInterface {

    Supplier createSupplier(SupplierDTO supplierDTO);

    SupplierDTO getSupplierById(Long id);

    List<SupplierDTO> getSuppliers();

    SupplierDTO updateSupplier(Long id, SupplierDTO supplierDTO);

    void deleteSupplier(Long id);

    List<SupplierDTO> searchSuppliers(String query);
}
