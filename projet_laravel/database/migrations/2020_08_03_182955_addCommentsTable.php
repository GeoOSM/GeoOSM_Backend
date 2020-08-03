<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddCommentsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        if (Schema::hasTable('comments')){}else{
            Schema::create('comments', function (Blueprint $table) {
                // $table->bigIncrements('id');
                $table->string('nom')->nullable();
                $table->string('email')->nullable();
                $table->string('description')->nullable();
                $table->string('date')->nullable();
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
        Schema::drop('comments');
    }
}
