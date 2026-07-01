package com.sports.lottery.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.sports.lottery.dto.DictDataResponse;
import com.sports.lottery.entity.SysDictData;

import java.util.List;

public interface SysDictDataService extends IService<SysDictData> {

    List<DictDataResponse> listByDictType(String dictType);
}
