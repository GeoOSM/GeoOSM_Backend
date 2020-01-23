<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

class UpdateThematiques extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('thematique', function (Blueprint $table) {
            if (!Schema::hasColumn('thematique','color')) {
                $table->text('color')->nullable();
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
            if (Schema::hasColumn('thematique','color')) {
                $table->dropColumn('color')();
            }
        });
    }
}
