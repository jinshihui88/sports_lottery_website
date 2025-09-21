package com.sports.lottery.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.sports.lottery.entity.RecommendRecord;

public interface RecommendRecordService extends IService<RecommendRecord> {

    IPage<RecommendRecord> pageByUser(Long userId, int current, int size);

    /**
     * 根据用户ID和查询条件分页查询推荐记录
     * 
     * @param userId        用户ID
     * @param current       当前页码
     * @param size          每页条数
     * @param recommendDate 推荐日期（可选）
     * @param matchDesc     比赛信息（可选，模糊查询）
     * @return 分页结果
     */
    IPage<RecommendRecord> pageByUserWithConditions(Long userId, int current, int size, String recommendDate,
            String matchDesc);
}
