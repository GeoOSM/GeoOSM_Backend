<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class UpdateCategorie extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('categorie', function (Blueprint $table) {
            if (!Schema::hasColumn('categorie','sql_complete')) {
                $table->text('sql_complete')->nullable();
            }

            if (!Schema::hasColumn('categorie','mode_sql')) {
                $table->boolean('mode_sql')->nullable();
            }

            if (!Schema::hasColumn('categorie','type_geom')) {
                $table->text('type_geom')->nullable();
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
        Schema::table('ccategorie', function (Blueprint $table) {
            if (Schema::hasColumn('ccategorie','sql_complete')) {
                $table->dropColumn('sql_complete')();
            }
            if (Schema::hasColumn('ccategorie','mode_sql')) {
                $table->dropColumn('mode_sql')();
            }
            if (Schema::hasColumn('ccategorie','type_geom')) {
                $table->dropColumn('type_geom')();
            }
        });
    }
}
