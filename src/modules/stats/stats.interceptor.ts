import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Observable } from "rxjs";
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
