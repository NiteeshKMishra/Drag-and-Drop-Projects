import { ValidateParams } from "../types/utils.js"

export function Validate(validateParams: ValidateParams): boolean{
    const value = validateParams.value
    const validations = validateParams.validations

    let isValid = true
    validations.forEach((validation => {
        if(validation){
            switch(validation){
                case 'required':
                    isValid = isValid && value.toString().trim().length !== 0
                    break
                case 'minLength':
                    isValid = isValid && value.toString().length >= 2
                    break
                case 'maxLength':
                    isValid = isValid && value.toString().length <= 20
                    break
                case 'min':
                    if(value != null && typeof value === 'number'){
                        isValid = isValid && value >= 1
                    }
                    break
                case 'max':
                    if(value != null && typeof value === 'number'){
                        isValid = isValid && value <= 20
                    }
                    break
                default:
                    isValid = isValid
            }
    }
    }))
    return isValid
}