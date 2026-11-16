<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * The order lifecycle is processing, sent, reported, cancelled. The retired
     * "delivered" and "being_delivered" values are folded into "sent" and the
     * PostgreSQL CHECK constraints follow the new set.
     */
    public function up(): void
    {
        $this->swap(['processing', 'sent', 'reported', 'cancelled']);
    }

    public function down(): void
    {
        $this->swap(['processing', 'sent', 'being_delivered', 'reported', 'cancelled']);
    }

    /**
     * @param  list<string>  $allowed
     */
    private function swap(array $allowed): void
    {
        $pgsql = DB::getDriverName() === 'pgsql';

        if ($pgsql) {
            DB::statement('ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check');
            DB::statement('ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_status_check');
        }

        if (! in_array('being_delivered', $allowed, true)) {
            DB::table('orders')->whereIn('status', ['delivered', 'being_delivered'])->update(['status' => 'sent']);
            DB::table('order_items')->whereIn('status', ['delivered', 'being_delivered'])->update(['status' => 'sent']);
        }

        if ($pgsql) {
            $list = "'".implode("', '", $allowed)."'";
            DB::statement("ALTER TABLE orders ADD CONSTRAINT orders_status_check CHECK (status IN ({$list}))");
            DB::statement("ALTER TABLE order_items ADD CONSTRAINT order_items_status_check CHECK (status IN ({$list}))");
        }
    }
};
