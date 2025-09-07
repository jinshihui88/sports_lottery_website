package com.sports.lottery.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;

/**
 * 投注记录查询DTO
 * 
 * @author CodeBuddy
 * @since 2024-01-01
 */
@Data
@EqualsAndHashCode(callSuper = true)
@Schema(description = "投注记录查询")
public class BettingRecordQuery extends PageQuery {

    @Schema(description = "用户ID")
    private Long userId;

    @Schema(description = "开始日期")
    private LocalDate startDate;

    @Schema(description = "结束日期")
    private LocalDate endDate;

    @Schema(description = "联赛名称")
    private String league;

    @Schema(description = "球队名称（主队或客队）")
    private String team;

    @Schema(description = "投注类型")
    private String betType;

    @Schema(description = "投注结果：0-待开奖，1-中奖，2-未中奖")
    private Integer result;

    @Schema(description = "运动类型：football-足球，basketball-篮球")
    private String sportType;
}