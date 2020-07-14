<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class UpdateCoucheSousThematique extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('couche-sous-thematique', function (Blueprint $table) {
            if (!Schema::hasColumn('couche-sous-thematique','logo_src')) {
                $table->text('logo_src')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('couche-sous-thematique', function (Blueprint $table) {
            if (Schema::hasColumn('couche-sous-thematique','logo_src')) {
                $table->dropColumn('logo_src')();
            }
        });
    }
}
