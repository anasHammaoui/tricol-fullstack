package com.example.tricol.tricolspringbootrestapi.service.impl;

import com.example.tricol.tricolspringbootrestapi.dto.request.SupplierDTO;
import com.example.tricol.tricolspringbootrestapi.exception.DuplicateResourceException;
import com.example.tricol.tricolspringbootrestapi.exception.ResourceNotFoundException;
import com.example.tricol.tricolspringbootrestapi.mapper.SupplierMapper;
import com.example.tricol.tricolspringbootrestapi.model.Supplier;
import com.example.tricol.tricolspringbootrestapi.repository.SupplierRepository;
import com.example.tricol.tricolspringbootrestapi.service.SupplierServiceInterface;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SupplierService implements SupplierServiceInterface {
    @Autowired
    private SupplierRepository supplierRepository;
    @Autowired
    private SupplierMapper supplierMapper;

    public Supplier createSupplier(SupplierDTO supplierDTO) {
        // Check for duplicate email
        if (supplierRepository.findByEmail(supplierDTO.getEmail()).isPresent()) {
            throw new DuplicateResourceException("Supplier with email '" + supplierDTO.getEmail() + "' already exists");
        }
        return supplierRepository.save(supplierMapper.toEntity(supplierDTO));
    }

    public SupplierDTO getSupplierById(Long id) {
        return supplierRepository.findById(id)
                .map(supplier -> supplierMapper.toDTO(supplier))
                .orElseThrow(() -> new ResourceNotFoundException("Supplier with id " + id + " not found"));
    }

    public List<SupplierDTO> getSuppliers() {
        return supplierMapper.toDTOList(supplierRepository.findAll());
    }

    // update a supplier
    public SupplierDTO updateSupplier(Long id, SupplierDTO supplierDTO) {
        Supplier existingSupplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier with id " + id + " not found"));

        supplierMapper.updateSupplierFromDTO(supplierDTO, existingSupplier);
        return supplierMapper.toDTO(supplierRepository.save(existingSupplier));
    }

    // delete a supplier
    public void deleteSupplier(Long id) {
        Supplier existingSupplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier with id " + id + " not found"));
        supplierRepository.delete(existingSupplier);
    }

    // search suppliers by society or contact agent
    public List<SupplierDTO> searchSuppliers(String query) {
        return supplierRepository
                .findBySocietyContainingIgnoreCaseOrContactAgentContainingIgnoreCase(query, query)
                .stream()
                .map(supplierMapper::toDTO)
                .collect(Collectors.toList());
    }
}