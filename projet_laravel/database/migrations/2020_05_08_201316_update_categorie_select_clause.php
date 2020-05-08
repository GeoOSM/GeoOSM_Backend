<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class UpdateCategorieSelectClause extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('categorie', function (Blueprint $table) {
            if (!Schema::hasColumn('categorie','select')) {
                $table->text('select')->nullable();
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
            if (Schema::hasColumn('ccategorie','select')) {
                $table->dropColumn('select')();
            }
         
        });
    }
}
