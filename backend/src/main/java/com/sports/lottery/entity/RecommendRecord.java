package com.sports.lottery.entity;

import com.baomidou.mybatisplus.annotation.*;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 推荐记录实体
 */
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("recommend_record")
@Schema(description = "推荐记录实体")
public class RecommendRecord {

    @Schema(description = "记录ID")
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    @Schema(description = "用户ID")
    @TableField("user_id")
    private Long userId;

    @Schema(description = "推荐日期")
    @TableField("recommend_date")
    private LocalDate recommendDate;

    @Schema(description = "比赛描述")
    @TableField("match_desc")
    private String matchDesc;

    @Schema(description = "推荐结果（如：主胜、让胜+让平等）")
    @TableField("recommendation")
    private String recommendation;

    @Schema(description = "推荐人")
    @TableField("recommender")
    private String recommender;

    @Schema(description = "最终结果：WIN/LOSE/NULL")
    @TableField("result")
    private String result;


    @Schema(description = "创建时间")
    @TableField(value = "create_time", fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @Schema(description = "更新时间")
    @TableField(value = "update_time", fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    @Schema(description = "逻辑删除：0-未删除，1-已删除")
    @TableField("deleted")
    @TableLogic
    private Integer deleted;
}
