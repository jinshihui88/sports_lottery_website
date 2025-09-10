package com.sports.lottery.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.sports.lottery.entity.RecommendRecord;

public interface RecommendRecordService extends IService<RecommendRecord> {

    IPage<RecommendRecord> pageByUser(Long userId, int current, int size);
}
