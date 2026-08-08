package com.example.admin.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

import javax.annotation.Resource;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Resource
    private AdminUserDetailsService adminUserDetailsService;

    @Resource
    private SecurityProperties securityProperties;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf().disable()
            .sessionManagement()
                .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
                .maximumSessions(1)
            .and()
            .and()
            .userDetailsService(adminUserDetailsService)
            .authorizeRequests()
                .antMatchers("/login").permitAll()
                .anyRequest().authenticated()
            .and()
            .formLogin()
                .loginProcessingUrl("/login")
                .usernameParameter("username")
                .passwordParameter("password")
                .successHandler((request, response, authentication) -> {
                    response.setContentType("application/json;charset=UTF-8");
                    response.getWriter().write("{\"code\":200,\"msg\":\"登录成功\",\"data\":{\"username\":\"" + authentication.getName() + "\"}}");
                })
                .failureHandler((request, response, exception) -> {
                    response.setContentType("application/json;charset=UTF-8");
                    response.getWriter().write("{\"code\":401,\"msg\":\"账号或密码错误\",\"data\":null}");
                })
            .and()
            .logout()
                .logoutUrl("/logout")
                .logoutSuccessHandler((request, response, authentication) -> {
                    response.setContentType("application/json;charset=UTF-8");
                    response.getWriter().write("{\"code\":200,\"msg\":\"已退出登录\",\"data\":null}");
                })
            .and()
            .exceptionHandling()
                .authenticationEntryPoint((request, response, authException) -> {
                    response.setContentType("application/json;charset=UTF-8");
                    response.getWriter().write("{\"code\":401,\"msg\":\"未登录或登录已过期\",\"data\":null}");
                })
            .and()
            .cors();

        return http.build();
    }
}
