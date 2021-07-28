export interface ValidateParams{
    value: string | number;
    validations: ['required'?, 'minLength'?, 'maxLength'?, 'min'?, 'max'?]
}
