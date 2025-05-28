import { MigrationInterface, QueryRunner } from 'typeorm'

export class RenameTenantsTable1748398385929 implements MigrationInterface {
    name = 'RenameTenantsTable1748398385929'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "Tennats" ("id" SERIAL NOT NULL, "name" character varying(100) NOT NULL, "address" character varying(255) NOT NULL, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_795256b0361a76e24f1ef3bfa77" PRIMARY KEY ("id"))`,
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "Tennats"`)
    }
}
