package com.sports.lottery.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Positive;
import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * 投注记录请求DTO
 * 
 * @author CodeBuddy
 * @since 2024-01-01
 */
@Data
@Schema(description = "投注记录请求")
public class BettingRecordRequest {

    @Schema(description = "投注日期", required = true)
    @NotNull(message = "投注日期不能为空")
    private LocalDate betDate;

    @Schema(description = "联赛名称", required = true)
    @NotBlank(message = "联赛名称不能为空")
    private String league;

    @Schema(description = "主队", required = true)
    @NotBlank(message = "主队不能为空")
    private String homeTeam;

    @Schema(description = "客队", required = true)
    @NotBlank(message = "客队不能为空")
    private String awayTeam;

    @Schema(description = "投注类型", required = true)
    @NotBlank(message = "投注类型不能为空")
    private String betType;

    @Schema(description = "投注选项", required = true)
    @NotBlank(message = "投注选项不能为空")
    private String betOption;

    @Schema(description = "投注金额（元）", required = true)
    @NotNull(message = "投注金额不能为空")
    @Positive(message = "投注金额必须大于0")
    private BigDecimal betAmount;

    @Schema(description = "赔率", required = true)
    @NotNull(message = "赔率不能为空")
    @Positive(message = "赔率必须大于0")
    private BigDecimal odds;

    @Schema(description = "投注结果：0-待开奖，1-中奖，2-未中奖")
    private Integer result;

    @Schema(description = "实际奖金（元）")
    private BigDecimal actualWinnings;

    @Schema(description = "比赛结果")
    private String matchResult;

    @Schema(description = "备注")
    private String notes;

    @Schema(description = "运动类型：football-足球，basketball-篮球", required = true)
    @NotBlank(message = "运动类型不能为空")
    private String sportType;
}