package com.yasar.listigo.demo.converter;

import com.yasar.listigo.demo.dto.UserDto;
import com.yasar.listigo.demo.dto.UserResponse;
import com.yasar.listigo.demo.entity.UserMetadata;
import org.springframework.stereotype.Component;

@Component
public class UserDtoConverter {

    public UserMetadata toEntity(UserDto userDto) {
        UserMetadata user = new UserMetadata();
        user.setEmail(userDto.getEmail());
        user.setPassword(userDto.getPassword());
        user.setName(userDto.getName());
        user.setPhone(userDto.getPhone());
        return user;
    }

    public UserResponse toUserResponse(UserMetadata user) {
        UserResponse response = new UserResponse();
        response.setUserId(user.getUserId());
        response.setEmail(user.getEmail());
        response.setName(user.getName());
        response.setPhone(user.getPhone());
        return response;
    }
}
