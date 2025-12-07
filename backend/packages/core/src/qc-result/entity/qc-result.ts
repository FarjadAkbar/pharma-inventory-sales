import { BaseEntity } from '@pharma/utils/entity';
import { Infer, InputValidator } from '@pharma/utils/validator';

const ID = InputValidator.string().uuid();
const SampleId = InputValidator.string().uuid();
const TestId = InputValidator.string().uuid();
const ResultValue = InputValidator.string();
const Passed = InputValidator.boolean();
const TestedBy = InputValidator.string().uuid();
const TestedAt = InputValidator.date();
const Remarks = InputValidator.string().optional();
const CreatedAt = InputValidator.date().nullish();
const UpdatedAt = InputValidator.date().nullish();

export const QCResultEntitySchema = InputValidator.object({
  id: ID,
  sampleId: SampleId,
  testId: TestId,
  resultValue: ResultValue,
  passed: Passed,
  testedBy: TestedBy,
  testedAt: TestedAt,
  remarks: Remarks,
  createdAt: CreatedAt,
  updatedAt: UpdatedAt
});

type QCResult = Infer<typeof QCResultEntitySchema>;

export class QCResultEntity extends BaseEntity<QCResultEntity>() {
  sampleId!: string;
  testId!: string;
  resultValue!: string;
  passed!: boolean;
  testedBy!: string;
  testedAt!: Date;
  remarks?: string;

  constructor(entity: QCResult) {
    super(QCResultEntitySchema);
    Object.assign(this, this.validate(entity));
  }
}
