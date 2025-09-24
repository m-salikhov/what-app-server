import {
	type CallHandler,
	type ExecutionContext,
	Injectable,
	type NestInterceptor,
} from "@nestjs/common";
import type { Observable } from "rxjs";
import { StatsService } from "./stats.service";

@Injectable()
export class StatsInterceptor implements NestInterceptor {
	constructor(private statsService: StatsService) {}

	intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
		const req = context.switchToHttp().getRequest();

		this.statsService.saveLoginStat(req);

		return next.handle();
	}
}
