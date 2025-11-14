package com.user.service;

import com.user.entity.User;
import com.user.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserMapper userMapper;

    @Transactional
    public Long save(User user) {
        int result = userMapper.insert(user);
        return result > 0 ? user.getId() : null;
    }

    @Transactional
    public int update(User user) {
        return userMapper.update(user);
    }

    @Transactional
    public int deleteById(Long id) {
        return userMapper.deleteById(id);
    }

    public User findById(Long id) {
        return userMapper.findById(id);
    }

    public User findByEmail(String email) {
        return userMapper.findByEmail(email);
    }

    public User findByNickname(String nickname) {
        return userMapper.findByNickname(nickname);
    }

    public List<User> findAll() {
        return userMapper.findAll();
    }

    public boolean existsByEmail(String email) {
        return userMapper.existsByEmail(email);
    }

    public boolean existsByNickname(String nickname) {
        return userMapper.existsByNickname(nickname);
    }
}

