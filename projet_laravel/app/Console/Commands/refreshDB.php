<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Http\Controllers\thematiqueController;

class refreshDB extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'refresh:database_osm';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Recalcul des count, surfaces, longueur';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return mixed
     */
    public function handle()
    {
        $this->info('Recalcul des count, surfaces, longueur, debut :');
        $thematique_controler = new thematiqueController();
        $thematique_controler->genrateAutomaticJsonFileByCat();
        $this->info('Recalcul des count, surfaces, longueur, terminé');
        //genrateAutomaticJsonFileByCat
    }
}
