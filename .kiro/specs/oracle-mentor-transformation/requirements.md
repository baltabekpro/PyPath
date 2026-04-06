# Requirements Document

## Introduction

This document specifies the requirements for transforming the AI assistant "Oracle" (Оракул) from a standard chatbot into an intelligent mentor that guides users with hints instead of providing complete solutions. The transformation includes scaffolding logic to prevent complete answers, improved multilingual support for Kazakh and Russian languages, and visual typography changes to support Cyrillic characters properly.

## Glossary

- **Oracle_System**: The AI assistant component of the PyPath learning platform that provides educational guidance
- **Scaffolding_Logic**: The intelligent barrier that prevents the AI from generating complete "turnkey" solutions
- **Hint_Response**: A partial answer that includes leading questions, solution algorithms, or directional guidance without complete code or solutions
- **Complete_Solution**: A ready-made answer including full code implementations, complete essays, or finished calculations
- **System_Prompt**: The foundational instruction set that defines the AI's behavior and constraints
- **Mentor_Mode**: The operational state where Oracle provides guidance through hints rather than direct answers
- **Language_Adapter**: The component responsible for generating linguistically correct responses in Kazakh and Russian
- **Typography_System**: The visual font rendering system for the user interface
- **Cyrillic_Support**: The capability to correctly display Russian and Kazakh alphabet characters
- **Kazakh_Extended_Characters**: The specific Kazakh alphabet characters: ә, і, ң, ғ, ү, ұ, қ, ө, һ
- **Response_Validator**: The component that verifies AI responses comply with scaffolding rules
- **Demonstration_Layer**: The code interface that displays the scaffolding logic implementation for defense purposes

## Requirements

### Requirement 1: Scaffolding Logic Implementation

**User Story:** As an educator, I want the AI to guide students with hints instead of complete solutions, so that students develop problem-solving skills independently.

#### Acceptance Criteria

1. WHEN a user requests help with a coding problem, THE Oracle_System SHALL provide a Hint_Response that includes leading questions or partial guidance
2. THE Oracle_System SHALL NOT generate Complete_Solution responses that include ready-made code implementations
3. WHEN a user requests an essay or written answer, THE Oracle_System SHALL provide structural guidance and key points without writing the complete text
4. WHEN a user requests help with calculations, THE Oracle_System SHALL explain the approach and formula without performing the complete calculation
5. THE System_Prompt SHALL contain explicit instructions that enforce the Mentor_Mode behavior
6. THE Response_Validator SHALL verify each AI response does not contain Complete_Solution content before delivery to the user

### Requirement 2: System Prompt Barrier

**User Story:** As a project defender, I want to demonstrate the code that implements the scaffolding barrier, so that I can prove the mentor functionality is technically implemented.

#### Acceptance Criteria

1. THE Demonstration_Layer SHALL expose the System_Prompt configuration for inspection
2. THE Demonstration_Layer SHALL display the scaffolding rules defined in the System_Prompt
3. WHEN an administrator requests to view the barrier implementation, THE Oracle_System SHALL provide access to the System_Prompt code
4. THE System_Prompt SHALL include measurable constraints that define what constitutes a Complete_Solution
5. THE Demonstration_Layer SHALL show the logical flow where scaffolding rules are applied to AI responses

### Requirement 3: Response Logging and Verification

**User Story:** As a project defender, I want to verify how the AI interprets scaffolding restrictions, so that I can demonstrate the system correctly prevents complete solutions.

#### Acceptance Criteria

1. WHEN the Oracle_System generates a response, THE Oracle_System SHALL log the request type classification (hint request, solution request, explanation request)
2. WHEN the Response_Validator evaluates a response, THE Oracle_System SHALL log whether the response passed or failed scaffolding validation
3. THE Oracle_System SHALL maintain a log of scaffolding rule applications for the most recent 100 interactions
4. WHEN an administrator requests verification logs, THE Oracle_System SHALL provide access to the scaffolding validation history
5. THE Oracle_System SHALL log the specific scaffolding rules that were applied to each response

### Requirement 4: Kazakh Language Quality

**User Story:** As a Kazakh-speaking student, I want AI responses in correct Kazakh without machine translation artifacts, so that I can learn effectively in my native language.

#### Acceptance Criteria

1. WHEN a user sends a message containing Kazakh_Extended_Characters, THE Language_Adapter SHALL detect the language as Kazakh
2. WHEN generating a response in Kazakh, THE Oracle_System SHALL produce linguistically correct text without Russian or English word mixing
3. THE Language_Adapter SHALL use professional terminology appropriate for educational content in Kazakh
4. WHEN the Oracle_System generates Kazakh responses, THE Oracle_System SHALL maintain consistent grammar and sentence structure
5. THE Language_Adapter SHALL enforce Kazakh-only responses when Kazakh language is detected, preventing language mixing in a single response

### Requirement 5: Russian Language Quality

**User Story:** As a Russian-speaking student, I want AI responses in correct Russian without machine translation artifacts, so that I can learn effectively in my native language.

#### Acceptance Criteria

1. WHEN a user sends a message in Russian without Kazakh_Extended_Characters, THE Language_Adapter SHALL detect the language as Russian
2. WHEN generating a response in Russian, THE Oracle_System SHALL produce linguistically correct text without Kazakh or English word mixing
3. THE Language_Adapter SHALL use professional terminology appropriate for educational content in Russian
4. WHEN the Oracle_System generates Russian responses, THE Oracle_System SHALL maintain consistent grammar and sentence structure
5. THE Language_Adapter SHALL enforce Russian-only responses when Russian language is detected, preventing language mixing in a single response

### Requirement 6: Typography System Update

**User Story:** As a user, I want the interface to use Times New Roman font family, so that the platform has a professional academic appearance.

#### Acceptance Criteria

1. THE Typography_System SHALL use Times New Roman as the primary font family for the main interface
2. WHERE Times New Roman is unavailable, THE Typography_System SHALL use Tinos or generic serif fonts as fallback options
3. THE Typography_System SHALL apply the font family to all text content in the AI chat interface
4. THE Typography_System SHALL apply the font family to all text content in the main learning interface
5. THE Typography_System SHALL maintain consistent font rendering across different browsers and operating systems

### Requirement 7: Cyrillic Character Support

**User Story:** As a user of Cyrillic alphabets, I want all Kazakh and Russian characters to display correctly, so that I can read content without character rendering issues.

#### Acceptance Criteria

1. THE Typography_System SHALL correctly render all Russian Cyrillic characters (А-Я, а-я)
2. THE Typography_System SHALL correctly render all Kazakh_Extended_Characters (ә, і, ң, ғ, ү, ұ, қ, ө, һ)
3. WHEN displaying text containing Kazakh_Extended_Characters, THE Typography_System SHALL render characters without replacement symbols or boxes
4. THE Typography_System SHALL support both uppercase and lowercase variants of all Cyrillic characters
5. WHEN a user inputs text containing Kazakh_Extended_Characters, THE Typography_System SHALL display the input correctly in all interface elements

### Requirement 8: Hint Response Structure

**User Story:** As a student, I want hints that guide my thinking process, so that I can arrive at solutions independently.

#### Acceptance Criteria

1. WHEN providing a Hint_Response for coding problems, THE Oracle_System SHALL include at least one leading question that prompts user reflection
2. WHEN providing a Hint_Response for coding problems, THE Oracle_System SHALL describe the solution approach without providing implementation code
3. WHEN a user has made an error, THE Oracle_System SHALL point to the error location without providing the corrected code
4. WHEN providing a Hint_Response, THE Oracle_System SHALL limit code examples to maximum 3 lines of pseudocode or syntax demonstration
5. WHEN a user requests multiple hints for the same problem, THE Oracle_System SHALL provide progressively more specific guidance while maintaining the scaffolding barrier

### Requirement 9: Parser and Serializer for System Prompt

**User Story:** As a developer, I want to parse and serialize the System Prompt configuration, so that I can programmatically manage scaffolding rules.

#### Acceptance Criteria

1. WHEN a System_Prompt configuration is provided, THE Parser SHALL parse it into a structured configuration object
2. WHEN an invalid System_Prompt configuration is provided, THE Parser SHALL return a descriptive error message
3. THE Pretty_Printer SHALL format configuration objects back into valid System_Prompt text
4. FOR ALL valid configuration objects, parsing then printing then parsing SHALL produce an equivalent object (round-trip property)
5. THE Parser SHALL validate that all required scaffolding rules are present in the System_Prompt configuration

### Requirement 10: Demonstration Interface

**User Story:** As a project defender, I want a demonstration interface that shows the scaffolding implementation, so that I can present the technical solution during defense.

#### Acceptance Criteria

1. THE Demonstration_Layer SHALL provide a user interface component that displays the current System_Prompt
2. THE Demonstration_Layer SHALL highlight the specific sections of the System_Prompt that implement scaffolding restrictions
3. WHEN a user interacts with the Oracle_System, THE Demonstration_Layer SHALL show in real-time which scaffolding rules are being applied
4. THE Demonstration_Layer SHALL provide example interactions that demonstrate the difference between Hint_Response and Complete_Solution
5. THE Demonstration_Layer SHALL be accessible through an administrative interface or debug mode
