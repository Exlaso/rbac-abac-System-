import { applyDecorators } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptions } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsArray,
    IsDate as MustDate,
    IsDefined,
    IsNumber as MustNumber,
    IsNumberOptions,
    IsString as MustString,
    Length,
    MaxDate as MustMaxDate,
    MinDate as MustMinDate,
    IsBoolean as MustBoolean,
    ValidateNested,
    ValidationOptions,
} from 'class-validator';

/**
 * Custom decorator to validate a string with optional length constraints.
 * Also integrates the string field into Swagger documentation.
 *
 * @param {object} options - The options to configure validation and Swagger documentation.
 * @param {ValidationOptions} [options.stringOption] - Additional options for class-validator's IsString.
 * @param {ApiPropertyOptions} [options.ApiPropertyOptions] - Custom Swagger property options.
 * @param {object} [options.length] - Min and max length constraints for the string.
 * @returns {MethodDecorator} - The decorated method.
 */
export function IsString({
                             stringOption,
                             ApiPropertyOptions,
                             length,
                         }: {
    stringOption?: ValidationOptions;
    ApiPropertyOptions?: ApiPropertyOptions;
    length?: { min: number; max: number };
}) {
    const OptionalDecorators = [];
    if (length) {
        // Adds length validation if constraints are provided
        OptionalDecorators.push(Length(length.min, length.max));
    }

    return applyDecorators(
        IsDefined(),  // Ensures the property is defined
        MustString(stringOption),  // Validates the property is a string
        ...OptionalDecorators,  // Adds optional length validation
        ApiProperty(ApiPropertyOptions),  // Integrates the property into Swagger
    );
}

/**
 * Custom decorator to validate a number, and integrates it into Swagger documentation.
 *
 * @param {object} options - The options to configure validation and Swagger documentation.
 * @param {IsNumberOptions} [options.numberOption] - Additional options for class-validator's IsNumber.
 * @param {ApiPropertyOptions} [options.ApiPropertyOptions] - Custom Swagger property options.
 * @returns {MethodDecorator} - The decorated method.
 */
export function IsNumber({
                             numberOption,
                             ApiPropertyOptions,
                         }: {
    numberOption?: IsNumberOptions;
    ApiPropertyOptions?: ApiPropertyOptions;
}) {
    return applyDecorators(
        IsDefined(),  // Ensures the property is defined
        MustNumber(numberOption),  // Validates the property is a number
        ApiProperty(ApiPropertyOptions),  // Integrates the property into Swagger
    );
}

/**
 * Custom decorator to validate a date, with optional minimum and maximum date constraints.
 * Also integrates the date field into Swagger documentation.
 *
 * @param {object} options - The options to configure validation and Swagger documentation.
 * @param {ValidationOptions} [options.dateOption] - Additional options for class-validator's IsDate.
 * @param {ApiPropertyOptions} [options.ApiPropertyOptions] - Custom Swagger property options.
 * @param {object} [options.MaxDate] - Maximum date constraint.
 * @param {object} [options.Mindate] - Minimum date constraint.
 * @returns {MethodDecorator} - The decorated method.
 */
export function IsDate({
                           dateOption,
                           ApiPropertyOptions,
                           MaxDate,
                           Mindate,
                       }: {
    dateOption?: ValidationOptions;
    ApiPropertyOptions?: ApiPropertyOptions;
    MaxDate?: {
        date: Date;
        message: string;
    };
    Mindate?: {
        date: Date;
        message: string;
    };
}) {
    const OptionalDecorators = [];
    if (Mindate) {
        // Adds minimum date validation if constraint is provided
        OptionalDecorators.push(
            MustMinDate(Mindate.date, {
                message: Mindate.message,
            }),
        );
    }
    if (MaxDate) {
        // Adds maximum date validation if constraint is provided
        OptionalDecorators.push(
            MustMaxDate(MaxDate.date, {
                message: MaxDate.message,
            }),
        );
    }

    return applyDecorators(
        IsDefined(),  // Ensures the property is defined
        MustDate(dateOption),  // Validates the property is a date
        ApiProperty(ApiPropertyOptions),  // Integrates the property into Swagger
        ...OptionalDecorators,  // Adds optional date range validations
        Type(() => Date),  // Ensures the type is correctly transformed to Date
    );
}

/**
 * Custom decorator to validate an ID, typically used for MongoDB ObjectIds.
 * It ensures the ID is a string of 24 characters and integrates it into Swagger documentation.
 *
 * @param {object} options - The options to configure validation and Swagger documentation.
 * @param {ApiPropertyOptions} [options.ApiPropertyOptions] - Custom Swagger property options.
 * @param {string} [options.idName] - The name of the ID (e.g., 'User').
 * @returns {MethodDecorator} - The decorated method.
 */
export function IsID({
                         ApiPropertyOptions,
                         idName,
                     }: {
    ApiPropertyOptions?: ApiPropertyOptions;
    idName?: string;
}) {
    return applyDecorators(
        IsDefined(),  // Ensures the property is defined
        MustString(),  // Validates the property is a string
        Length(24, 24, {
            message: `Invalid ${idName} ID`,  // Ensures the ID is 24 characters
        }),
        ApiProperty({
            description: `${idName} ID`,  // Provides a description for Swagger
            example: '60f1b0e1f9f9b3f1b4f9b3f1',  // Example of a valid ID
            ...ApiPropertyOptions,  // Custom Swagger options
        }),
    );
}

/**
 * Custom decorator to validate an array of nested objects, ensuring each item is of the specified type.
 * Integrates the array into Swagger documentation.
 *
 * @param {object} options - The options to configure validation and Swagger documentation.
 * @param {any} options.type - The type of the nested objects in the array.
 * @param {ApiPropertyOptions} [options.ApiPropertyOptions] - Custom Swagger property options.
 * @returns {MethodDecorator} - The decorated method.
 */
export function IsNestedArray({
                                  type,
                                  ApiPropertyOptions,
                              }: {
    type: any;
    ApiPropertyOptions?: ApiPropertyOptions;
}) {
    return applyDecorators(
        IsArray(),  // Ensures the property is an array
        ValidateNested({ each: true }),  // Ensures each element in the array is validated
        Type(() => type),  // Ensures the type of each element is correctly transformed
        ApiProperty(
            ApiPropertyOptions ?? {
                description: 'Nested Array',  // Provides a description for Swagger
                type: [type],  // Defines the type of the array elements
            },
        ),
    );
}

/**
 * Custom decorator to ensure the string value is in uppercase.
 *
 * @returns {MethodDecorator} - The decorated method.
 */
export function IsUpperCase() {
    return applyDecorators(
        Type(() => String().toUpperCase)  // Converts the string to uppercase
    );
}

/**
 * Custom decorator to validate a boolean value and integrate it into Swagger documentation.
 *
 * @param {object} options - The options to configure validation and Swagger documentation.
 * @param {ApiPropertyOptions} [options.ApiPropertyOptions] - Custom Swagger property options.
 * @returns {MethodDecorator} - The decorated method.
 */
export function IsBoolean({
                              ApiPropertyOptions,
                          }: {
    ApiPropertyOptions?: ApiPropertyOptions;
}) {
    return applyDecorators(
        IsDefined(),  // Ensures the property is defined
        MustBoolean(),  // Validates the property is a boolean
        ApiProperty(ApiPropertyOptions ?? { type: Boolean }),  // Integrates the property into Swagger
    );
}
