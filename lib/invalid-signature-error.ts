import { InvalidTokenError } from './invalid-token-error';

export class InvalidSignatureError extends InvalidTokenError {
	static getDefaultMessage(): string {
		return 'Invalid signature';
	}
}
