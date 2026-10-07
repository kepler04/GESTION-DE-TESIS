package com.tesistrack.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tesistrack.model.Role;
import com.tesistrack.model.User;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    List<User> findByRole(Role role);

    /** Los asesores que dieron el sí a las asesorías privadas (uno a uno, fuera de una clase). */
    List<User> findByRoleAndAsesoriasPrivadasTrue(Role role);
}
