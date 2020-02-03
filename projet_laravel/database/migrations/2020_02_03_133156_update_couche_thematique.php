<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class UpdateCoucheThematique extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('couche-thematique', function (Blueprint $table) {
            if (!Schema::hasColumn('couche-thematique','logo_src')) {
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
        Schema::table('couche-thematique', function (Blueprint $table) {
            if (Schema::hasColumn('couche-thematique','logo_src')) {
                $table->dropColumn('logo_src')();
            }
        });
    }
}
