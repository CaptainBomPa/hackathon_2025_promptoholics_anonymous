package com.promptoholics.anonymous.ApiBackend.services;

import com.promptoholics.anonymous.ApiBackend.domain.dto.PensionCalculationDto;
import org.apache.poi.hssf.usermodel.HSSFRow;
import org.apache.poi.hssf.usermodel.HSSFSheet;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class ReportServiceXls {

    private static String[] HEADERS = {
            "Data użycia", "Godzina użycia", "Emerytura oczekiwana",
            "Wiek", "Płeć", "Wysokość wynagrodzenia",
            "Uwzględniał L4", "Środki ZUS",
            "Emerytura rzeczywista", "Emerytura urealniona",
            "Kod pocztowy"
    };

    public ReportServiceXls() {

    }

    public File generateReport(String directoryPath, String fileName) throws IOException {
        //TODO dodaj repo
        List<PensionCalculationDto> pensionCalculations = List.of(PensionCalculationDto.builder()
                .id(UUID.randomUUID())
                .createdAt(Instant.now())
                .age(19)
                .postalCode("43-100")
                .build());

        try (HSSFWorkbook workbook = new HSSFWorkbook()) {
            HSSFSheet sheet = workbook.createSheet("Raport");

            HSSFRow headerRow = sheet.createRow(0);
            for (int i = 0; i < HEADERS.length; i++) {
                headerRow.createCell(i).setCellValue(HEADERS[i]);
            }

            int rowNum = 1;
            for (PensionCalculationDto pensionCalculation : pensionCalculations) {
                HSSFRow row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(pensionCalculation.getCreatedAt().toString());
                row.createCell(1).setCellValue(pensionCalculation.getCreatedAt().toString());
                row.createCell(2).setCellValue(pensionCalculation.getExpectedPension());
                row.createCell(3).setCellValue(pensionCalculation.getAge());
                row.createCell(4).setCellValue(pensionCalculation.getGender() != null ? pensionCalculation.getGender() : "");
                row.createCell(5).setCellValue(pensionCalculation.getSalaryAmount());
                row.createCell(6).setCellValue(pensionCalculation.isIncludedSicknessPeriods() ? "TAK" : "NIE");
                row.createCell(7).setCellValue(pensionCalculation.getAccumulatedFundsTotal() != null ? pensionCalculation.getAccumulatedFundsTotal() : 0);
                row.createCell(8).setCellValue(pensionCalculation.getActualPension() != null ? pensionCalculation.getActualPension() : 0);
                row.createCell(9).setCellValue(pensionCalculation.getInflationAdjustedPension() != null ? pensionCalculation.getInflationAdjustedPension() : 0);
                row.createCell(10).setCellValue(pensionCalculation.getPostalCode() != null ? pensionCalculation.getPostalCode() : "");
            }


            for (int i = 0; i < HEADERS.length; i++) {
                sheet.autoSizeColumn(i);
            }

            File dir = new File(directoryPath);
            if (!dir.exists()) {
                dir.mkdirs();
            }

            File file = new File(dir, fileName + ".xls");

            try (FileOutputStream fos = new FileOutputStream(file)) {
                workbook.write(fos);
            }

            return file;
        }
    }
}
