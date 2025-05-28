import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddTenantIdForeignKey1748399202319 implements MigrationInterface {
    name = 'AddTenantIdForeignKey1748399202319'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "tenantId" integer`)
        await queryRunner.query(
            `ALTER TABLE "users" ADD CONSTRAINT "FK_c58f7e88c286e5e3478960a998b" FOREIGN KEY ("tenantId") REFERENCES "Tennats"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "users" DROP CONSTRAINT "FK_c58f7e88c286e5e3478960a998b"`,
        )
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "tenantId"`)
    }
}
