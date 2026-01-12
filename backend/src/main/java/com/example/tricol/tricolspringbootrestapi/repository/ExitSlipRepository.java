package com.example.tricol.tricolspringbootrestapi.repository;

import com.example.tricol.tricolspringbootrestapi.enums.ExitSlipStatus;
import com.example.tricol.tricolspringbootrestapi.model.ExitSlip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExitSlipRepository extends JpaRepository<ExitSlip, Long> {
    
    Optional<ExitSlip> findBySlipNumber(String slipNumber);
    
    List<ExitSlip> findByStatus(ExitSlipStatus status);
    
    List<ExitSlip> findByDestinationWorkshop(String destinationWorkshop);
    
    List<ExitSlip> findByDestinationWorkshopAndStatus(String destinationWorkshop, ExitSlipStatus status);
}
