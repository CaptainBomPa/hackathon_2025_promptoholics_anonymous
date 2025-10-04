package com.promptoholics.anonymous.ApiBackend.services;

import com.promptoholics.anonymous.ApiBackend.domain.PensionCalculationRepository;
import com.promptoholics.anonymous.ApiBackend.domain.dto.PensionCalculationDto;
import lombok.RequiredArgsConstructor;
import org.apache.poi.hssf.usermodel.HSSFRow;
import org.apache.poi.hssf.usermodel.HSSFSheet;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.OffsetDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminReportServiceXls {

    private static String[] HEADERS = {
            "Data użycia", "Godzina użycia", "Emerytura oczekiwana",
            "Wiek", "Płeć", "Wysokość wynagrodzenia",
            "Uwzględniał L4", "Środki ZUS",
            "Emerytura rzeczywista", "Emerytura urealniona",
            "Kod pocztowy"
    };

    private final PensionCalculationRepository pensionCalculationRepository;

    public ByteArrayResource generateReportInMemory(OffsetDateTime start, OffsetDateTime end) {
        try (HSSFWorkbook workbook = new HSSFWorkbook()) {
            HSSFSheet sheet = workbook.createSheet("Raport");
            HSSFRow headerRow = sheet.createRow(0);
            for (int i = 0; i < HEADERS.length; i++) {
                headerRow.createCell(i).setCellValue(HEADERS[i]);
            }

            // przykładowe dane
            List<PensionCalculationDto> pensionCalculations = pensionCalculationRepository.findByCreatedAtBetween(start, end).stream()
                .map(PensionCalculationDto::fromEntity)
                .toList();

            int rowNum = 1;
            for (PensionCalculationDto dto : pensionCalculations) {
                HSSFRow row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(dto.getCreatedAt().toString());
                row.createCell(1).setCellValue(dto.getCreatedAt().toString());
                row.createCell(2).setCellValue(dto.getExpectedPension());
                row.createCell(3).setCellValue(dto.getAge());
                row.createCell(4).setCellValue(dto.getGender() != null ? dto.getGender() : "");
                row.createCell(5).setCellValue(dto.getSalaryAmount());
                row.createCell(6).setCellValue(dto.isIncludedSicknessPeriods() ? "TAK" : "NIE");
                row.createCell(7).setCellValue(dto.getAccumulatedFundsTotal() != null ? dto.getAccumulatedFundsTotal() : 0);
                row.createCell(8).setCellValue(dto.getActualPension() != null ? dto.getActualPension() : 0);
                row.createCell(9).setCellValue(dto.getInflationAdjustedPension() != null ? dto.getInflationAdjustedPension() : 0);
                row.createCell(10).setCellValue(dto.getPostalCode() != null ? dto.getPostalCode() : "");
            }

            for (int i = 0; i < HEADERS.length; i++) {
                sheet.autoSizeColumn(i);
            }

            ByteArrayOutputStream bos = new ByteArrayOutputStream();
            workbook.write(bos);
            return new ByteArrayResource(bos.toByteArray());
        } catch (Exception ex) {
            throw new RuntimeException("Failed to generate admin report.");
        }
    }
}
