package com.sports.lottery.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.sports.lottery.entity.RecommendRecord;
import com.sports.lottery.mapper.RecommendRecordMapper;
import com.sports.lottery.service.RecommendRecordService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RecommendRecordServiceImpl extends ServiceImpl<RecommendRecordMapper, RecommendRecord> implements RecommendRecordService {

    // 使用 ServiceImpl 默认的 baseMapper 即可

    @Override
    public IPage<RecommendRecord> pageByUser(Long userId, int current, int size) {
        Page<RecommendRecord> page = new Page<>(current, size);
        QueryWrapper<RecommendRecord> wrapper = new QueryWrapper<>();
        wrapper.eq("user_id", userId).orderByDesc("recommend_date", "create_time");
        return page(page, wrapper);
    }
}
