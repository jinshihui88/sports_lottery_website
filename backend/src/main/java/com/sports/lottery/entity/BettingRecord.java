package com.sports.lottery.entity;

import com.baomidou.mybatisplus.annotation.*;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 投注记录实体类
 * 
 * @author CodeBuddy
 * @since 2024-01-01
 */
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("betting_record")
@Schema(description = "投注记录实体")
public class BettingRecord {

    @Schema(description = "记录ID")
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    @Schema(description = "用户ID")
    @TableField("user_id")
    private Long userId;

    @Schema(description = "投注日期")
    @TableField("bet_date")
    private LocalDate betDate;

    @Schema(description = "联赛名称")
    @TableField("league")
    private String league;

    @Schema(description = "主队")
    @TableField("home_team")
    private String homeTeam;

    @Schema(description = "客队")
    @TableField("away_team")
    private String awayTeam;

    @Schema(description = "投注类型：胜平负、让球、大小球等")
    @TableField("bet_type")
    private String betType;

    @Schema(description = "投注选项")
    @TableField("bet_option")
    private String betOption;

    @Schema(description = "投注金额（分）")
    @TableField("bet_amount")
    private Integer betAmount;

    @Schema(description = "赔率")
    @TableField("odds")
    private BigDecimal odds;

    @Schema(description = "投注结果：0-待开奖，1-中奖，2-未中奖")
    @TableField("result")
    private Integer result;

    @Schema(description = "实际奖金（分）")
    @TableField("actual_winnings")
    private Integer actualWinnings;

    @Schema(description = "盈亏金额（分）")
    @TableField("profit_loss")
    private Integer profitLoss;

    @Schema(description = "比赛结果")
    @TableField("match_result")
    private String matchResult;

    @Schema(description = "备注")
    @TableField("notes")
    private String notes;

    @Schema(description = "运动类型：football-足球，basketball-篮球")
    @TableField("sport_type")
    private String sportType;

    @Schema(description = "创建时间")
    @TableField(value = "create_time", fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @Schema(description = "更新时间")
    @TableField(value = "update_time", fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    @Schema(description = "是否删除：0-未删除，1-已删除")
    @TableField("deleted")
    @TableLogic
    private Integer deleted;
}