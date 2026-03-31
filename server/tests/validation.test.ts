import { describe, it, expect, vi } from "vitest";
import { registerSchema, loginSchema, validateLicenseSchema } from "../lib/validation.js";

describe("Validation Schemas", () => {
  describe("registerSchema", () => {
    it("should validate a correct registration object", () => {
      const data = {
        email: "test@example.com",
        password: "password123",
        firstName: "John",
        lastName: "Doe",
        role: "agent",
      };
      expect(registerSchema.parse(data)).toEqual(data);
    });

    it("should fail on invalid email", () => {
      const data = {
        email: "not-an-email",
        password: "password123",
        firstName: "John",
        lastName: "Doe",
        role: "agent",
      };
      expect(() => registerSchema.parse(data)).toThrow();
    });
  });

  describe("loginSchema", () => {
    it("should validate a correct login object", () => {
      const data = {
        email: "test@example.com",
        password: "password123",
      };
      expect(loginSchema.parse(data)).toEqual(data);
    });
  });

  describe("validateLicenseSchema", () => {
    it("should validate a correct validation object", () => {
      const data = {
        status: "approved",
        comment: "Looks good",
      };
      expect(validateLicenseSchema.parse(data)).toEqual(data);
    });

    it("should fail on invalid status", () => {
      const data = {
        status: "invalid_status",
      };
      expect(() => validateLicenseSchema.parse(data)).toThrow();
    });
  });
});
