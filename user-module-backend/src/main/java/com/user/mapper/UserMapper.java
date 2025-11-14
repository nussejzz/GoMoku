package com.user.mapper;

import com.user.entity.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface UserMapper {
    int insert(User user);
    int update(User user);
    int deleteById(@Param("id") Long id);
    User findById(@Param("id") Long id);
    User findByEmail(@Param("email") String email);
    User findByNickname(@Param("nickname") String nickname);
    List<User> findAll();
    boolean existsByEmail(@Param("email") String email);
    boolean existsByNickname(@Param("nickname") String nickname);
}

