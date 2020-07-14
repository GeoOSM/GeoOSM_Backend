<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class UpdateThematiquesOrdre extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('thematique', function (Blueprint $table) {
            if (!Schema::hasColumn('thematique','ordre')) {
                $table->integer('ordre')->nullable();
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
        Schema::table('thematique', function (Blueprint $table) {
            if (Schema::hasColumn('thematique','ordre')) {
                $table->dropColumn('ordre')();
            }
         
        });
    }
}
