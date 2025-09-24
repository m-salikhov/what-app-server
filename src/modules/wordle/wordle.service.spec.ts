import { Test, type TestingModule } from "@nestjs/testing";
import { WordleService } from "./wordle.service";

describe("WordleService", () => {
	let service: WordleService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [WordleService],
		}).compile();

		service = module.get<WordleService>(WordleService);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});
});
