package com.user.mapper;

import com.user.entity.UserToken;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface UserTokenMapper {
    int insert(UserToken userToken);
    int update(UserToken userToken);
    int deleteById(@Param("id") Long id);
    int deleteByUserId(@Param("userId") Long userId);
    UserToken findById(@Param("id") Long id);
    UserToken findByUserId(@Param("userId") Long userId);
    UserToken findByRefreshToken(@Param("refreshToken") String refreshToken);
    int saveOrUpdate(UserToken userToken);
}

