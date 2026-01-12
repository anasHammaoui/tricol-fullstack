package com.example.tricol.tricolspringbootrestapi.controller;

import com.example.tricol.tricolspringbootrestapi.dto.request.SupplierDTO;
import com.example.tricol.tricolspringbootrestapi.dto.response.ErrorResponse;
import com.example.tricol.tricolspringbootrestapi.model.Supplier;
import com.example.tricol.tricolspringbootrestapi.service.SupplierServiceInterface;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/suppliers")
@Tag(name = "Supplier Management", description = "APIs for managing suppliers and vendor relationships")
public class SupplierController {
    @Autowired
    private SupplierServiceInterface supplierService;

    @Operation(
            summary = "Create a new supplier",
            description = "Creates a new supplier with contact information and business details"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Supplier created successfully",
                    content = @Content(schema = @Schema(implementation = Supplier.class))),
            @ApiResponse(responseCode = "400", description = "Invalid input data",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PostMapping("/create")
    @PreAuthorize("hasAuthority('SUPPLIERS_WRITE')")
    public ResponseEntity<Supplier> createSupplier(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "Supplier data to create",
                    required = true,
                    content = @Content(schema = @Schema(implementation = SupplierDTO.class))
            )
            @Valid @RequestBody SupplierDTO supplierDTO) {
        Supplier supplier = supplierService.createSupplier(supplierDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(supplier);
    }

    @Operation(
            summary = "Get all suppliers",
            description = "Retrieves a list of all suppliers in the system"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Suppliers retrieved successfully",
                    content = @Content(schema = @Schema(implementation = SupplierDTO.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @GetMapping
    @PreAuthorize("hasAnyAuthority('SUPPLIERS_READ', 'SUPPLIERS_WRITE')")
    public ResponseEntity<List<SupplierDTO>> getAllSuppliers() {
        List<SupplierDTO> suppliers = supplierService.getSuppliers();
        return ResponseEntity.ok(suppliers);
    }

    @Operation(
            summary = "Get supplier by ID",
            description = "Retrieves a specific supplier by its unique identifier"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Supplier found successfully",
                    content = @Content(schema = @Schema(implementation = SupplierDTO.class))),
            @ApiResponse(responseCode = "404", description = "Supplier not found",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('SUPPLIERS_READ', 'SUPPLIERS_WRITE')")
    public ResponseEntity<SupplierDTO> getSupplierById(
            @Parameter(description = "ID of the supplier to retrieve", required = true, example = "1")
            @PathVariable Long id) {
        SupplierDTO supplier = supplierService.getSupplierById(id);
        return ResponseEntity.ok(supplier);

    }

    @Operation(
            summary = "Update a supplier",
            description = "Updates an existing supplier's information"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Supplier updated successfully",
                    content = @Content(schema = @Schema(implementation = SupplierDTO.class))),
            @ApiResponse(responseCode = "404", description = "Supplier not found",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid input data",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('SUPPLIERS_WRITE')")
    public ResponseEntity<SupplierDTO> updateSupplier(
            @Parameter(description = "ID of the supplier to update", required = true, example = "1")
            @PathVariable Long id,
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "Updated supplier data",
                    required = true,
                    content = @Content(schema = @Schema(implementation = SupplierDTO.class))
            )
            @Valid @RequestBody SupplierDTO supplierDTO) {
        SupplierDTO updatedSupplier = supplierService.updateSupplier(id, supplierDTO);
        return ResponseEntity.ok(updatedSupplier);
    }

    @Operation(
            summary = "Delete a supplier",
            description = "Deletes a supplier from the system"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Supplier deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Supplier not found",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('SUPPLIERS_WRITE')")
    public ResponseEntity<String> deleteSupplier(
            @Parameter(description = "ID of the supplier to delete", required = true, example = "1")
            @PathVariable Long id) {
        supplierService.deleteSupplier(id);
        return ResponseEntity.ok("deleted successfully");
    }

    @Operation(
            summary = "Search suppliers",
            description = "Search suppliers by society name or contact agent name"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Search completed successfully",
                    content = @Content(schema = @Schema(implementation = SupplierDTO.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @GetMapping("/search")
    @PreAuthorize("hasAnyAuthority('SUPPLIERS_READ', 'SUPPLIERS_WRITE')")
    public ResponseEntity<List<SupplierDTO>> searchSuppliers(
            @Parameter(description = "Search query for supplier society or contact agent", required = true, example = "ABC Corp")
            @RequestParam("q") String query) {
        List<SupplierDTO> suppliers = supplierService.searchSuppliers(query);
        return ResponseEntity.ok(suppliers);
    }
}