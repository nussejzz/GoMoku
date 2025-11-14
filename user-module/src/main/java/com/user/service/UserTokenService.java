package com.user.service;

import com.user.entity.UserToken;
import com.user.mapper.UserTokenMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserTokenService {
    private final UserTokenMapper userTokenMapper;

    @Transactional
    public Long save(UserToken userToken) {
        int result = userTokenMapper.insert(userToken);
        return result > 0 ? userToken.getId() : null;
    }

    @Transactional
    public int update(UserToken userToken) {
        return userTokenMapper.update(userToken);
    }

    @Transactional
    public int deleteById(Long id) {
        return userTokenMapper.deleteById(id);
    }

    @Transactional
    public int deleteByUserId(Long userId) {
        return userTokenMapper.deleteByUserId(userId);
    }

    public UserToken findById(Long id) {
        return userTokenMapper.findById(id);
    }

    public UserToken findByUserId(Long userId) {
        return userTokenMapper.findByUserId(userId);
    }

    public UserToken findByRefreshToken(String refreshToken) {
        return userTokenMapper.findByRefreshToken(refreshToken);
    }

    @Transactional
    public int saveOrUpdate(UserToken userToken) {
        return userTokenMapper.saveOrUpdate(userToken);
    }
}

