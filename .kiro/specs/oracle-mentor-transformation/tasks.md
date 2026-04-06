# Implementation Plan: Oracle Mentor Transformation

## Overview

This implementation plan transforms the PyPath AI assistant "Oracle" (Оракул) into an intelligent mentor that guides students with hints rather than providing complete solutions. The plan follows a 4-week implementation schedule covering backend scaffolding logic, frontend integration, language enhancements, and comprehensive testing.

## Tasks

- [x] 1. Set up scaffolding engine infrastructure
  - Create `backend/app/services/scaffolding_engine.py` module
  - Define `ScaffoldingRule` and `RequestType` data models
  - Implement `build_mentor_prompt()` method with language-aware system prompt construction
  - Implement `classify_request_type()` method to detect hint vs. solution requests
  - Implement `get_scaffolding_rules()` method to return active rules
  - _Requirements: 1.1, 1.5, 8.1_

- [ ]* 1.1 Write property test for mentor prompt construction
  - **Property 1: Hint Responses Structure**
  - **Validates: Requirements 1.1, 8.1, 8.2, 8.4**

- [x] 2. Implement response validator
  - [x] 2.1 Create `backend/app/services/response_validator.py` module
    - Define `ValidationResult` data model
    - Implement `validate_response()` method with rule checking logic
    - Implement `detect_complete_solution()` method using pattern matching
    - Implement `count_code_lines()` method to parse code blocks
    - _Requirements: 1.6, 8.4_

  - [ ]* 2.2 Write property test for complete solution detection
    - **Property 2: No Complete Solutions**
    - **Validates: Requirements 1.2**

  - [ ]* 2.3 Write property test for essay guidance structure
    - **Property 3: Essay Guidance Structure**
    - **Validates: Requirements 1.3**

  - [ ]* 2.4 Write property test for calculation approach detection
    - **Property 4: Calculation Approach Without Solution**
    - **Validates: Requirements 1.4**

  - [ ]* 2.5 Write property test for validator accuracy
    - **Property 5: Validator Detects Complete Solutions**
    - **Validates: Requirements 1.6**

- [x] 3. Implement validation logger
  - [x] 3.1 Create `backend/app/services/validation_logger.py` module
    - Define `LogEntry` data model
    - Implement `log_interaction()` method with JSON storage
    - Implement `get_recent_logs()` method with 100-entry limit
    - Implement `get_user_logs()` method for user-specific retrieval
    - _Requirements: 3.1, 3.2, 3.3, 3.5_

  - [ ]* 3.2 Write property test for request type logging
    - **Property 6: Request Type Logging**
    - **Validates: Requirements 3.1**

  - [ ]* 3.3 Write property test for validation result logging
    - **Property 7: Validation Result Logging**
    - **Validates: Requirements 3.2**

  - [ ]* 3.4 Write property test for log size bounding
    - **Property 8: Log Size Bounded**
    - **Validates: Requirements 3.3**

  - [ ]* 3.5 Write property test for applied rules in logs
    - **Property 9: Log Entries Contain Applied Rules**
    - **Validates: Requirements 3.5**

- [x] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Integrate scaffolding into AI service
  - [x] 5.1 Modify `backend/app/services/ai_service.py`
    - Add `chat_with_scaffolding()` method that integrates scaffolding engine
    - Add `get_scaffolding_status()` method to expose configuration
    - Inject scaffolding rules into system prompt building
    - Add response validation before returning to user
    - Integrate validation logger for all interactions
    - _Requirements: 1.5, 1.6, 2.1, 2.2_

  - [ ]* 5.2 Write property test for error help responses
    - **Property 18: Error Help Without Corrections**
    - **Validates: Requirements 8.3**

  - [ ]* 5.3 Write property test for progressive hints
    - **Property 19: Progressive Hints Maintain Scaffolding**
    - **Validates: Requirements 8.5**

- [x] 6. Create API endpoints for scaffolding
  - [x] 6.1 Add scaffolding routes to `backend/app/api/ai_routes.py`
    - Create `POST /api/ai/chat` endpoint with `enable_scaffolding` parameter
    - Create `GET /api/ai/scaffolding/status` endpoint
    - Create `GET /api/ai/scaffolding/logs` endpoint with user_id filtering
    - Add request/response schemas to `backend/app/schemas/ai_schemas.py`
    - _Requirements: 2.3, 2.4, 3.4_

  - [ ]* 6.2 Write integration tests for scaffolding endpoints
    - Test chat endpoint with scaffolding enabled
    - Test status endpoint returns correct configuration
    - Test logs endpoint with filtering
    - _Requirements: 2.3, 2.4, 3.4_

- [x] 7. Enhance language detection and quality
  - [x] 7.1 Enhance Kazakh language detection in `backend/app/services/ai_service.py`
    - Update `detect_language()` to recognize all Kazakh extended characters (ә, і, ң, ғ, ү, ұ, қ, ө, һ)
    - Add language purity validation to response validator
    - Update `_language_instruction()` with stronger enforcement prompts
    - _Requirements: 4.1, 4.2, 4.5, 5.1, 5.2, 5.5_

  - [ ]* 7.2 Write property test for Kazakh language detection
    - **Property 10: Kazakh Language Detection**
    - **Validates: Requirements 4.1**

  - [ ]* 7.3 Write property test for Kazakh language purity
    - **Property 11: Kazakh Language Purity**
    - **Validates: Requirements 4.2, 4.5**

  - [ ]* 7.4 Write property test for Russian language detection
    - **Property 12: Russian Language Detection**
    - **Validates: Requirements 5.1**

  - [ ]* 7.5 Write property test for Russian language purity
    - **Property 13: Russian Language Purity**
    - **Validates: Requirements 5.2, 5.5**

- [x] 8. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Update typography system for Cyrillic support
  - [x] 9.1 Update `styles.css` with Times New Roman font family
    - Add Times New Roman as primary font with Tinos and Liberation Serif fallbacks
    - Add @font-face declarations for Cyrillic unicode ranges (U+0400-04FF, U+0500-052F)
    - Add .kazakh-text class with localized font features
    - Apply font-family to body, input, textarea, button elements
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 7.1, 7.2, 7.4, 7.5_

  - [ ]* 9.2 Write property test for Russian Cyrillic rendering
    - **Property 14: Russian Cyrillic Rendering**
    - **Validates: Requirements 7.1**

  - [ ]* 9.3 Write property test for Kazakh character rendering
    - **Property 15: Kazakh Character Rendering**
    - **Validates: Requirements 7.2, 7.3**

  - [ ]* 9.4 Write property test for Cyrillic case support
    - **Property 16: Cyrillic Case Support**
    - **Validates: Requirements 7.4**

  - [ ]* 9.5 Write property test for input field Cyrillic rendering
    - **Property 17: Input Field Cyrillic Rendering**
    - **Validates: Requirements 7.5**

- [x] 10. Update AIChat component with scaffolding status
  - [x] 10.1 Modify `components/AIChat.tsx`
    - Add `showScaffoldingStatus` and `enableDemonstration` props
    - Add scaffolding status indicator in header
    - Add hint/guidance badges on AI responses
    - Update message type handling to distinguish hints from complete answers
    - Integrate with new scaffolding-enabled chat endpoint
    - _Requirements: 2.1, 10.1_

  - [ ]* 10.2 Write component tests for AIChat scaffolding features
    - Test scaffolding status display
    - Test hint badge rendering
    - Test scaffolding endpoint integration
    - _Requirements: 2.1, 10.1_

- [x] 11. Create demonstration panel component
  - [x] 11.1 Create `components/DemonstrationPanel.tsx`
    - Implement panel with system prompt display
    - Add real-time scaffolding rule application display
    - Add validation logs viewer with filtering
    - Add example interactions showcase (hint vs. complete solution)
    - Add code view highlighting scaffolding logic
    - _Requirements: 2.2, 2.3, 2.5, 10.2, 10.3, 10.4, 10.5_

  - [ ]* 11.2 Write component tests for demonstration panel
    - Test system prompt display
    - Test log viewer functionality
    - Test example interactions display
    - _Requirements: 10.2, 10.3, 10.4_

- [x] 12. Implement system prompt parser and serializer
  - [x] 12.1 Create `backend/app/services/prompt_parser.py` module
    - Implement parser to convert system prompt text to configuration object
    - Implement pretty printer to serialize configuration back to text
    - Add validation for required scaffolding rules
    - Add error handling with descriptive messages
    - _Requirements: 9.1, 9.2, 9.3, 9.5_

  - [ ]* 12.2 Write property test for system prompt parsing
    - **Property 20: System Prompt Parsing**
    - **Validates: Requirements 9.1**

  - [ ]* 12.3 Write property test for parser error handling
    - **Property 21: Parser Error Handling**
    - **Validates: Requirements 9.2**

  - [ ]* 12.4 Write property test for configuration serialization
    - **Property 22: Configuration Serialization**
    - **Validates: Requirements 9.3**

  - [ ]* 12.5 Write property test for configuration round-trip
    - **Property 23: Configuration Round-Trip**
    - **Validates: Requirements 9.4**

  - [ ]* 12.6 Write property test for required rules validation
    - **Property 24: Required Rules Validation**
    - **Validates: Requirements 9.5**

- [x] 13. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 14. Integration and wiring
  - [x] 14.1 Wire demonstration panel into admin interface
    - Add demonstration panel toggle to admin panel
    - Connect demonstration panel to scaffolding status endpoint
    - Connect demonstration panel to validation logs endpoint
    - _Requirements: 10.1, 10.5_

  - [x] 14.2 Update AIChatPage component with scaffolding support
    - Integrate scaffolding-enabled chat endpoint
    - Add optional demonstration panel toggle for admins
    - Update message rendering to show scaffolding indicators
    - _Requirements: 2.1, 10.1_

  - [ ]* 14.3 Write end-to-end integration tests
    - Test complete scaffolding flow from user request to validated response
    - Test language detection and quality enforcement
    - Test demonstration panel data flow
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 4.1, 5.1_

- [x] 15. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional property-based tests and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation throughout implementation
- Property tests validate universal correctness properties from the design document
- The implementation follows a 4-week schedule: Week 1 (Backend Scaffolding), Week 2 (Frontend Integration), Week 3 (Language Enhancement), Week 4 (Testing & Refinement)
- All 24 correctness properties from the design document are covered by property-based test tasks
- Typography changes apply globally to ensure consistent Cyrillic rendering
- Demonstration panel is admin-only for project defense purposes
