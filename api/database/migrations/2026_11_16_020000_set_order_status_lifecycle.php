<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Order lifecycle: processing, sent (the parcel left and is being delivered),
     * shipped (the parcel was delivered), reported, cancelled. The retired
     * "delivered" value becomes "shipped" and the interim "being_delivered" value
     * becomes "sent"; the PostgreSQL CHECK constraints follow the new set.
     */
    public function up(): void
    {
        $this->swap(
            ['delivered' => 'shipped', 'being_delivered' => 'sent'],
            ['processing', 'sent', 'shipped', 'reported', 'cancelled'],
        );
    }

    public function down(): void
    {
        $this->swap(
            ['shipped' => 'delivered'],
            ['processing', 'sent', 'delivered', 'reported', 'cancelled'],
        );
    }

    /**
     * @param  array<string, string>  $remap
     * @param  list<string>  $allowed
     */
    private function swap(array $remap, array $allowed): void
    {
        $pgsql = DB::getDriverName() === 'pgsql';

        if ($pgsql) {
            DB::statement('ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check');
            DB::statement('ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_status_check');
        }

        foreach ($remap as $from => $to) {
            DB::table('orders')->where('status', $from)->update(['status' => $to]);
            DB::table('order_items')->where('status', $from)->update(['status' => $to]);
        }

        if ($pgsql) {
            $list = "'".implode("', '", $allowed)."'";
            DB::statement("ALTER TABLE orders ADD CONSTRAINT orders_status_check CHECK (status IN ({$list}))");
            DB::statement("ALTER TABLE order_items ADD CONSTRAINT order_items_status_check CHECK (status IN ({$list}))");
        }
    }
};
