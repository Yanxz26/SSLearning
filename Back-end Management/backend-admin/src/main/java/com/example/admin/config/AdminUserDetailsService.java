package com.example.admin.config;

import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;

/**
 * 从 application.yml 配置加载管理员账号，不再硬编码在 Java 代码中。
 * 密码以 BCrypt 哈希存储在配置文件中，支持环境变量覆盖。
 */
@Service
public class AdminUserDetailsService implements UserDetailsService {

    @Resource
    private SecurityProperties securityProperties;

    @Resource
    private PasswordEncoder passwordEncoder;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        if (!securityProperties.getAdminUsername().equals(username)) {
            throw new UsernameNotFoundException("用户不存在: " + username);
        }
        return User.builder()
                .username(securityProperties.getAdminUsername())
                .password(securityProperties.getAdminPassword())
                .roles("ADMIN")
                .build();
    }
}
