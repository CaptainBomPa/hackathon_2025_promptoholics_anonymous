package com.promptoholics.anonymous.ApiBackend.services;

import com.promptoholics.anonymous.ApiBackend.domain.dto.PensionCalculationReportDto;
import org.apache.poi.hssf.usermodel.HSSFRow;
import org.apache.poi.hssf.usermodel.HSSFSheet;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
public class ReportServiceXls {

    private static final String[] HEADERS = {
            "Data użycia", "Godzina użycia", "Emerytura oczekiwana",
            "Wiek", "Płeć", "Wysokość wynagrodzenia",
            "Uwzględniał L4", "Środki ZUS",
            "Emerytura rzeczywista", "Emerytura urealniona",
            "Kod pocztowy"
    };

    public ByteArrayResource generateReportInMemory() throws IOException {
        try (HSSFWorkbook workbook = new HSSFWorkbook();
             ByteArrayOutputStream bos = new ByteArrayOutputStream()) {

            HSSFSheet sheet = workbook.createSheet("Raport");

            HSSFRow headerRow = sheet.createRow(0);
            for (int i = 0; i < HEADERS.length; i++) {
                headerRow.createCell(i).setCellValue(HEADERS[i]);
            }

            List<PensionCalculationReportDto> pensionCalculations = List.of(
                    PensionCalculationReportDto.builder()
                            .id(UUID.randomUUID())
                            .createdAt(Instant.now())
                            .age(19)
                            .postalCode("43-100")
                            .build()
            );

            DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd")
                    .withZone(ZoneId.systemDefault());
            DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm:ss")
                    .withZone(ZoneId.systemDefault());

            int rowNum = 1;
            for (PensionCalculationReportDto dto : pensionCalculations) {
                HSSFRow row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(dateFormatter.format(dto.getCreatedAt()));   // Data
                row.createCell(1).setCellValue(timeFormatter.format(dto.getCreatedAt()));   // Godzina
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

            workbook.write(bos);
            return new ByteArrayResource(bos.toByteArray());
        }
    }
}
