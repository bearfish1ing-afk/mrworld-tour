package com.mrworldthemetour.backend.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {
    @Bean
    public OpenAPI openAPI(){
        String jwtSchemeName="JWT";

        return new OpenAPI()
                .components(new Components()
                        .addSecuritySchemes(jwtSchemeName,new SecurityScheme()
                                .name(jwtSchemeName)
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                        ))
                .addSecurityItem(new SecurityRequirement().addList(jwtSchemeName))
                .info(apiInfo());
    }

    private Info apiInfo(){
        return new Info()
                .title("mrworldtour")
                .description("여행사 웹사이트")
                .version("1.0.0");
    }
}
