package com.mrworldthemetour.backend.product;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "theme")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Theme {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "theme_id")
    private Long id;

    @Column(name = "theme_name", length = 50)
    private String themeName;

    @Column(name = "description", length = 255)
    private String description;

    public Theme(String themeName, String description) {
        this.themeName = themeName;
        this.description = description;
    }
}