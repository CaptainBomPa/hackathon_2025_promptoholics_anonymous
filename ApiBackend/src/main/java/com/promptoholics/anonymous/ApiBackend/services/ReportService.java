package com.promptoholics.anonymous.ApiBackend.services;

import com.promptoholics.anonymous.ApiBackend.adapters.repository.PostgresPensionCalculationRepository;
import com.promptoholics.anonymous.ApiBackend.domain.PensionCalculationEntity;
import com.promptoholics.anonymous.ApiBackend.schemas.dtos.PensionCalculationReportJsonDto;
import lombok.RequiredArgsConstructor;
import org.apache.poi.hssf.usermodel.HSSFRow;
import org.apache.poi.hssf.usermodel.HSSFSheet;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.openapitools.jackson.nullable.JsonNullable;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportService {
    private static final ZoneId ZONE_POLAND = ZoneId.of("Europe/Warsaw");
    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("HH:mm:ss");
    private final PostgresPensionCalculationRepository repository;

    private static final String[] HEADERS = {
            "Data użycia", "Godzina użycia", "Emerytura oczekiwana",
            "Wiek", "Płeć", "Wysokość wynagrodzenia",
            "Uwzględniał L4", "Środki ZUS",
            "Emerytura rzeczywista", "Emerytura urealniona",
            "Kod pocztowy"
    };

    public ByteArrayResource generateReportInMemory(LocalDate dateFrom, LocalDate dateTo) throws IOException {
        Instant from = dateFrom.atStartOfDay(ZoneId.systemDefault()).toInstant();
        Instant to = dateTo.plusDays(1).atStartOfDay(ZoneId.systemDefault()).toInstant();

        return generateReport(repository.findAllByCreatedAtBetween(from, to));
    }

    private ByteArrayResource generateReport(List<PensionCalculationEntity> data) {
        try (HSSFWorkbook workbook = new HSSFWorkbook();
             ByteArrayOutputStream bos = new ByteArrayOutputStream()) {

            HSSFSheet sheet = workbook.createSheet("Raport");

            HSSFRow headerRow = sheet.createRow(0);
            for (int i = 0; i < HEADERS.length; i++) {
                headerRow.createCell(i).setCellValue(HEADERS[i]);
            }

            DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd").withZone(ZoneId.systemDefault());
            DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm:ss").withZone(ZoneId.systemDefault());

            int rowNum = 1;
            for (PensionCalculationEntity dto : data) {
                HSSFRow row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(dateFormatter.format(dto.getCreatedAt()));
                row.createCell(1).setCellValue(timeFormatter.format(dto.getCreatedAt()));
                row.createCell(2).setCellValue(dto.getExpectedPension());
                row.createCell(3).setCellValue(dto.getAge());
                row.createCell(4).setCellValue(dto.getGender() != null ? dto.getGender() : "");
                row.createCell(5).setCellValue(dto.getSalaryAmount());
                row.createCell(6).setCellValue(Boolean.TRUE.equals(dto.isIncludedSicknessPeriods()) ? "TAK" : "NIE");
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
        } catch (IOException e) {
            throw new RuntimeException("Błąd generowania raportu XLS", e);
        }
    }

    public List<PensionCalculationReportJsonDto> generateJsonReport(LocalDate dateFrom, LocalDate dateTo) {
        Instant from = dateFrom.atStartOfDay(ZoneId.systemDefault()).toInstant();
        Instant to = dateTo.plusDays(1).atStartOfDay(ZoneId.systemDefault()).toInstant();
        return toReportJsonList(repository.findAllByCreatedAtBetween(from, to));
    }

    private List<PensionCalculationReportJsonDto> toReportJsonList(List<PensionCalculationEntity> entities) {
        if (entities == null || entities.isEmpty()) {
            return List.of();
        }

        return entities.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    private PensionCalculationReportJsonDto toDto(PensionCalculationEntity e) {
        // Konwersja czasu UTC -> lokalny (Polska)
        OffsetDateTime createdAt = e.getCreatedAt() != null
                ? e.getCreatedAt().atOffset(ZoneOffset.UTC)
                : null;

        LocalDate date = null;
        String time = null;

        if (createdAt != null) {
            ZonedDateTime local = createdAt.atZoneSameInstant(ZONE_POLAND);
            date = local.toLocalDate();
            time = local.toLocalTime().format(TIME_FMT);
        }

        PensionCalculationReportJsonDto dto = new PensionCalculationReportJsonDto(
                e.getId(),
                createdAt,
                e.getExpectedPension(),
                e.getAge(),
                e.getGender(),
                e.getSalaryAmount(),
                e.isIncludedSicknessPeriods()
        );

        dto.setDate(date);
        dto.setTime(time);

        if (e.getAccumulatedFundsTotal() != null)
            dto.setAccumulatedFundsTotal(JsonNullable.of(e.getAccumulatedFundsTotal()));

        if (e.getActualPension() != null)
            dto.setActualPension(JsonNullable.of(e.getActualPension()));

        if (e.getInflationAdjustedPension() != null)
            dto.setInflationAdjustedPension(JsonNullable.of(e.getInflationAdjustedPension()));

        if (e.getPostalCode() != null)
            dto.setPostalCode(JsonNullable.of(e.getPostalCode()));

        return dto;
    }
}
