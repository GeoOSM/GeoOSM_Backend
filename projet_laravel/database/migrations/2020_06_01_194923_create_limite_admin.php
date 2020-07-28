<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateLimiteAdmin extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        if (Schema::hasTable('limite_admin')){}else{
            Schema::create('limite_admin', function (Blueprint $table) {
                $table->bigIncrements('id_limite');
                $table->string('nom');
                $table->string('nom_table');
                $table->boolean('sous_thematiques');
                $table->integer('key_couche');
                $table->timestamps();
            });
        }
    }
    
    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::drop('limite_admin');
    }
}
